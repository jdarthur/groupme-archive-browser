package common

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"net/http"
	"time"
)

var UserId = "userId"

//InvalidUserError is thrown when calling a user-controlled endpoint without a valid JWT
type InvalidUserError struct {
	UserId string
}

func (e InvalidUserError) Code() int {
	return http.StatusBadRequest
}

func (e InvalidUserError) Error() string {
	return fmt.Sprintf("User %v is not valid", e.UserId)
}

type InvalidTokenError struct {
	Token string
}

func (e InvalidTokenError) Error() string {
	return fmt.Sprintf("Token '%v' is not valid", e.Token)
}

type MissingTokenError struct{}

func (e MissingTokenError) Code() int {
	return http.StatusUnauthorized
}

func (e MissingTokenError) Error() string {
	return fmt.Sprintf("Missing auth token")
}

var Auth0Domain = ""
var Auth0Audience = ""

type Jwks struct {
	Keys []JSONWebKeys `json:"keys"`
}

type JSONWebKeys struct {
	Kty string   `json:"kty"`
	Kid string   `json:"kid"`
	Use string   `json:"use"`
	N   string   `json:"n"`
	E   string   `json:"e"`
	X5c []string `json:"x5c"`
}

var JwtKeys = Jwks{}

func LoadCerts() error {
	resp, err := http.Get(Auth0Domain + ".well-known/jwks.json")
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(&JwtKeys)
	return err
}

func getPemCert(token *jwt.Token) (string, error) {
	cert := ""
	for k, _ := range JwtKeys.Keys {
		if token.Header["kid"] == JwtKeys.Keys[k].Kid {
			cert = "-----BEGIN CERTIFICATE-----\n" + JwtKeys.Keys[k].X5c[0] + "\n-----END CERTIFICATE-----"
		}
	}

	if cert == "" {
		err := errors.New("unable to find appropriate key")
		return cert, err
	}

	return cert, nil
}

func DecodeToken(jwtToken string) (jwt.MapClaims, error) {

	token, err := jwt.Parse(jwtToken, func(token *jwt.Token) (interface{}, error) {

		// Verify 'aud' claim
		checkAud := token.Claims.(jwt.MapClaims).VerifyAudience(Auth0Audience, false)
		if !checkAud {
			return token, errors.New("invalid audience")
		}
		// Verify 'iss' claim
		checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(Auth0Domain, false)
		if !checkIss {
			return token, errors.New("invalid issuer")
		}

		cert, err := getPemCert(token)
		if err != nil {
			panic(err.Error())
		}

		result, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
		return result, nil
	})

	if err != nil {
		fmt.Println(err)
		validation, ok := err.(*jwt.ValidationError)
		if ok {
			isNotValidYet := validation.Errors ^ jwt.ValidationErrorIssuedAt
			if isNotValidYet == 0 {
				val := token.Claims.(jwt.MapClaims)["iat"]
				issuedAt := val.(float64)
				difference := issuedAt - float64(time.Now().Unix())
				if difference < 30 {
					fmt.Printf("%f seconds early, good enough\n", difference)
					token.Valid = true
				}
			} else {
				return nil, InvalidTokenError{Token: jwtToken}
			}
		} else {
			return nil, InvalidTokenError{Token: jwtToken}
		}
	}

	if !token.Valid {
		return nil, InvalidTokenError{Token: jwtToken}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("failed to get claims")
	}

	return claims, nil
}

func AsUser(c *gin.Context) {
	tokenValue := c.GetHeader("auth0-token")
	if tokenValue != "" {
		token, err := DecodeToken(tokenValue)
		if err != nil {
			apiErr := ApiErrorf400("Token error: ", err.Error())
			RespondWithError(c, apiErr)
			c.Abort()
			return
		}

		userId, ok := token["sub"]
		if !ok {
			RespondWithError(c, InvalidUserError{UserId: ""})
			c.Abort()
			return
		}

		c.Set(UserId, userId)
		c.Next()
	} else {
		RespondWithError(c, MissingTokenError{})
		c.Abort()
		return
	}
}

func AssertUser(c *gin.Context, correctUserId string) error {
	value, ok := c.Get(UserId)
	if ok {
		userIdFromRequest := value.(string)
		if correctUserId != userIdFromRequest {
			return InvalidUserError{UserId: userIdFromRequest}
		}
	} else {
		return InvalidUserError{UserId: ""}
	}
	return nil
}

func AssertHasUserId(c *gin.Context) (string, error) {
	value, ok := c.Get(UserId)
	if ok {
		userIdFromRequest := value.(string)
		return userIdFromRequest, nil
	} else {
		return "", InvalidUserError{UserId: ""}
	}
}
