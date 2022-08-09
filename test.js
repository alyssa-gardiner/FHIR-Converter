function test() {
    let test = String(process.env.npm_config_myVar);
    return "this was called"
}
console.log(test())