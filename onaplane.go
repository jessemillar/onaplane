package main

import (
	"io/ioutil"
	"os"
	"unicode"
)

func check(e error) { // Check file IO calls for errors
	if e != nil {
		panic(e)
	}
}

func main() {
	data, err := ioutil.ReadFile(os.Args[1])
	check(err)
	content := []rune(string(data[:]))

	for i := 0; i < len(content); i++ {
		if content[i] == '_' {
			content[i+1] = unicode.ToUpper(content[i+1])
			content = append(content[:i], content[i+1:]...)
		}
	}

	err = ioutil.WriteFile(os.Args[1], []byte(string(content)), 0644)
	check(err)
}
