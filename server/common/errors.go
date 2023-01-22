package common

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

type ApiError interface {
	Error() string
	Code() int
}

func RespondWithError(c *gin.Context, apiError ApiError) {
	c.JSON(apiError.Code(), gin.H{"success": false, "error": apiError.Error()})
}

func RespondSuccess(c *gin.Context, data interface{}, length int, create bool) {
	code := http.StatusOK
	if create {
		code = http.StatusCreated
	}
	c.JSON(code, gin.H{"success": true, "length": length, "resource": data})
}

func Respond500(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
}

type ApiNotImplementedError struct{}

func (a ApiNotImplementedError) Error() string {
	return "Not implemented"
}

func (a ApiNotImplementedError) Code() int {
	return http.StatusNotImplemented
}

type ApiError400 struct {
	Message string
}

func (a ApiError400) Error() string {
	return a.Message
}

func (a ApiError400) Code() int {
	return http.StatusBadRequest
}

type ApiError404 struct {
	Message string
}

func (a ApiError404) Error() string {
	return a.Message
}

func (a ApiError404) Code() int {
	return http.StatusNotFound
}

func ApiErrorf400(format string, e ...interface{}) ApiError400 {
	return ApiError400{Message: fmt.Sprintf(format, e...)}
}

type ApiError500 struct {
	Message string
}

func (a ApiError500) Error() string {
	return a.Message
}

func (a ApiError500) Code() int {
	return http.StatusInternalServerError
}

func ApiErrorf500(format string, e ...interface{}) ApiError500 {
	return ApiError500{Message: fmt.Sprintf(format, e...)}
}
