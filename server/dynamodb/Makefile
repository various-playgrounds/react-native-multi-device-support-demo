
.PHONY: run-dynamo-docker
run-dynamo-docker:
	docker run -it -p 8000:8000 dwmkerr/dynamodb -sharedDb

.PHONY: stop-remove-dockers
stop-remove-dockers:
	@docker stop $(docker ps -aq)
	@docker rm $(docker ps -aq)