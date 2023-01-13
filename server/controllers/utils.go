package controllers

import (
	"archive/zip"
	"fmt"
	"io/ioutil"
)

func getBytesString(totalBytes int) string {
	if totalBytes > 1024*1024*1024 {
		return fmt.Sprintf("%.2f Gb", float64(totalBytes)/(1024*1024*1024))
	} else if totalBytes > 1024*1024 {
		return fmt.Sprintf("%.2f Mb", float64(totalBytes)/(1024*1024))
	} else if totalBytes > 1024 {
		return fmt.Sprintf("%.2f Kb", float64(totalBytes)/1024)
	} else {
		return fmt.Sprintf("%.d b", totalBytes)
	}
}

func readZipFile(zf *zip.File) ([]byte, error) {
	f, err := zf.Open()
	if err != nil {
		return nil, err
	}
	defer f.Close()
	return ioutil.ReadAll(f)
}
