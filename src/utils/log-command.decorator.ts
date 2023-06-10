export function Log(message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            console.log(message);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
