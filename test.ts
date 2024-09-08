function first() {
    console.log('first(): factory evaluated')
    return function (target: any, propertyKey: any) {
        console.log(arguments)
        console.log('first(): called')
    }
}
class User {
    constructor() {}

    @first()
    method() {}
}

const user = new User()
user.method()
