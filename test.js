function test() {
    test = String(process.env.npm_config_myVar)
    return test;
}
console.log(test())