/**
 * Decorator to log a custom message to the console when the decorated method is invoked.
 *
 * @param message - The message to be logged to the console.
 *
 * @example
 * @Log('myCommand has been called')
 * public async myCommand(interaction: Subcommand.ChatInputCommandInteraction) { ... }
 */
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
