# check if golang exists and give message telling user to
# install if missing
ifeq (, $(shell which go))
$(info "No 'golang' in PATH, please install golang to build")
$(info "  linux      : sudo apt-get install golang")
$(info "  macosx     : brew install golang")
$(info "  download   : https://golang.org/download/")
$(error "unable to complete build")
endif

.DEFAULT_GOAL := standard

BINARY_NAME ?= main

AIRBIN := air
ifeq ($(shell uname -s),Linux)
   AIRBIN = air-linux
endif

standard:
	$(info Building binary with name: $(BINARY_NAME))
	@go build -o $(BINARY_NAME) .

watch:
	$(info Using ./$(AIRBIN) utility to watch and live-reload)
	@./$(AIRBIN)

clean:
	@rm -f $(BINARY_NAME)
	@rm -f $(BINARY_NAME)-linux
