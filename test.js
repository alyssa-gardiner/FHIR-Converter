function test() {
    return String(process.env.npm_config_myVar);
}
console.log(test())