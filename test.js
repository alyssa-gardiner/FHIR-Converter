function test() {
    return process.env.npm_config_myVar;
}
console.log(test())