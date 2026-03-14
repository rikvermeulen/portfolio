import debounce from "./debounce.ts";

jest.useFakeTimers();

describe("debounce", () => {
  let func: jest.Mock<void>;
  let debouncedFunc: ReturnType<typeof debounce>;

  beforeEach(() => {
    func = jest.fn() as jest.Mock<void, [string]>;
  });

  it("should debounce the function calls", () => {
    debouncedFunc = debounce(func, 1000);

    debouncedFunc("first");
    debouncedFunc("second");
    debouncedFunc("third");

    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith("third");
  });

  it("should call the function immediately if leading is true", () => {
    debouncedFunc = debounce(func, 1000, { leading: true, trailing: false });

    debouncedFunc("first");
    debouncedFunc("second");
    debouncedFunc("third");

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith("first");

    jest.advanceTimersByTime(1000);

    expect(func).toHaveBeenCalledTimes(1);
  });

  it("should call the function on both leading and trailing edges", () => {
    debouncedFunc = debounce(func, 1000, { leading: true, trailing: true });

    debouncedFunc("first");
    debouncedFunc("second");

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith("first");

    jest.advanceTimersByTime(1000);

    expect(func).toHaveBeenCalledTimes(2);
    expect(func).toHaveBeenCalledWith("second");
  });

  it("should allow cancellation of the debounced function", () => {
    debouncedFunc = debounce(func, 1000);

    debouncedFunc("first");
    debouncedFunc.cancel();

    jest.advanceTimersByTime(1000);

    expect(func).not.toHaveBeenCalled();
  });

  it("should handle multiple debounced functions independently", () => {
    const func1: jest.Mock<void, [unknown]> = jest.fn();
    const func2: jest.Mock<void, [unknown]> = jest.fn();

    const debouncedFunc1 = debounce(func1, 500);
    const debouncedFunc2 = debounce(func2, 1000);

    debouncedFunc1("a");
    debouncedFunc2(1);

    jest.advanceTimersByTime(500);

    expect(func1).toHaveBeenCalledTimes(1);
    expect(func1).toHaveBeenCalledWith("a");
    expect(func2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(func2).toHaveBeenCalledTimes(1);
    expect(func2).toHaveBeenCalledWith(1);
  });

  it("should maintain `this` context", () => {
    const context = {
      value: 42,
      method: function (arg: string) {
        expect(this).toBe(context);
        expect(arg).toBe("test");
      },
    };

    const spy = jest.spyOn(context, "method");

    const debouncedMethod = debounce(
      context.method.bind(context) as (...args: unknown[]) => unknown,
      1000,
    );

    debouncedMethod.call(context, "test");

    jest.advanceTimersByTime(1000);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("test");
  });

  it("should return the result of the function when leading is true", () => {
    const funcWithReturn: jest.Mock<number, [number]> = jest.fn((x) => x * 2);
    const debounced = debounce(
      funcWithReturn as unknown as (...args: unknown[]) => unknown,
      1000,
      {
        leading: true,
        trailing: false,
      },
    );

    const result1 = debounced(5);
    expect(result1).toBe(10);
    expect(funcWithReturn).toHaveBeenCalledTimes(1);
    expect(funcWithReturn).toHaveBeenCalledWith(5);

    const result2 = debounced(6);
    expect(result2).toBe(10);
    expect(funcWithReturn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    const result3 = debounced(7);
    expect(result3).toBe(14);
    expect(funcWithReturn).toHaveBeenCalledTimes(2);
    expect(funcWithReturn).toHaveBeenCalledWith(7);
  });

  it("should use the default delay when none is provided", () => {
    debouncedFunc = debounce(func);

    debouncedFunc("default1");
    debouncedFunc("default2");

    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith("default2");
  });

  it("should clear the pending timer and reset args when timer is active", () => {
    debouncedFunc("active");
    const clearSpy = jest.spyOn(global, "clearTimeout");

    debouncedFunc.cancel();

    expect(clearSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(func).not.toHaveBeenCalled();

    clearSpy.mockRestore();
  });

  it("should skip clearTimeout but still reset args when there's no pending timer", () => {
    const clearSpy = jest.spyOn(global, "clearTimeout");

    debouncedFunc.cancel();

    expect(clearSpy).not.toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
