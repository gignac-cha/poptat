export const throttle = <R, F extends R>(callback: F & Function, duration: number): R => {
  let now = Date.now();
  return ((...arguments_: unknown[]) => {
    if (Date.now() - now > duration) {
      now = Date.now();
      return callback(...arguments_);
    }
  }) as R;
};
