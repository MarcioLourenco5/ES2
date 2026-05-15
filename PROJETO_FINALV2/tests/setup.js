process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
jest.setTimeout(10000);

const mockPrototype = Object.getPrototypeOf(jest.fn());
if (typeof mockPrototype.returnThis !== 'function') {
  mockPrototype.returnThis = function returnThis() {
    return this.mockReturnThis();
  };
}