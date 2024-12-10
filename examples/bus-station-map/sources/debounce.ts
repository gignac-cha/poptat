export const debounce = <R, F extends R>(callback: F & Function, delay: number): R => {
  let timeoutID: NodeJS.Timeout | undefined = undefined;
  return ((...arguments_: unknown[]) => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => callback(...arguments_), delay);
  }) as R;
};
