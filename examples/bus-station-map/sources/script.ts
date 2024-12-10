import { throttle } from './throttle';

window.addEventListener('load', () => {
  const searchQueryElement = document.querySelector<HTMLInputElement>('#search-query');
  if (!searchQueryElement) {
    return;
  }

  searchQueryElement.addEventListener(
    'keyup',
    throttle(async (event) => {
      const query = searchQueryElement.value.trim();
      if (query.length === 0) {
        return;
      }

      const url = new URL('https://kakao-bus.r-s-account.workers.dev');
      url.pathname = '/search';
      url.searchParams.set('type', 'bus');
      url.searchParams.set('query', query);
      const response = await fetch(url);
      console.log(await response.json());
    }, 100),
  );
});
