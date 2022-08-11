function test() {
    return "This is the actual thing that I want to return like do you have access to it";
}
// test();

process.stdout.write(test());
// console.log(test());