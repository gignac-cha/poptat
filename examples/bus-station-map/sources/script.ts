import { createElement } from './elements';
import { throttle } from './throttle';

window.addEventListener('load', () => {
  const elements = {
    searchQuery: document.querySelector<HTMLInputElement>('#search-query'),
    searchListContainer: document.querySelector<HTMLOListElement>('#search-list-container'),
    searchList: document.querySelector<HTMLOListElement>('#search-list'),
    canvas: document.querySelector<HTMLCanvasElement>('#canvas'),
  };
  if (!elements.searchQuery) {
    return;
  }

  const drawStationPath = (
    paths: {
      id: string;
      masterId: string;
      name: string;
      point: { x: number; y: number };
      realTime: boolean;
      virtual: boolean;
      direction: string;
      busStopSubways: unknown[];
      expectedFirstLastTimes: {
        firstTime: `${number}:${number}`;
        lastTime: `${number}:${number}`;
      };
      busLineDependentDisplayName: string;
      turningPoint: boolean;
      itsId: string;
      displayId: string;
      busLineDependentDisplayId: string;
    }[],
    locations: {
      sectionOrder: number;
      sectionDist: number;
      sectionOffsetDist: number;
      arrivalBusStop: boolean;
      nextBusStopArrivalTime: number;
      lastVehicle: boolean;
      firstVehicle: boolean;
      vehicleId: string;
      vehicleNumber: string;
      vehicleType: number;
      collectDateTime: string;
      collectStatus: 'NORMAL';
      remainSeat: number;
      congestion: 'EMPTY';
      point: unknown | null;
      status: unknown | null;
      bikeOn: boolean;
    }[],
  ) => {
    if (!elements.canvas) {
      return;
    }
    const context = elements.canvas.getContext('2d');
    if (!context) {
      return;
    }

    const xList = paths.map(({ point }) => point.x);
    const yList = paths.map(({ point }) => point.y);
    const minimumX = Math.min(...xList);
    const maximumX = Math.max(...xList);
    const minimumY = Math.min(...yList);
    const maximumY = Math.max(...yList);
    const absoluteWidth = maximumX - minimumX;
    const absoluteHeight = maximumY - minimumY;
    const width = elements.canvas.clientWidth;
    const height = Math.floor(width * (1 / (absoluteWidth / absoluteHeight)));
    elements.canvas.setAttribute('width', `${width}`);
    elements.canvas.setAttribute('height', `${height}`);

    const ratio = width / absoluteWidth;

    context.clearRect(0, 0, width, height);

    context.save();
    context.beginPath();
    context.strokeStyle = 'white';
    context.lineWidth = 1;
    let isFirst = true;
    for (const { point } of paths) {
      const x = (point.x - minimumX) * ratio;
      const y = height - (point.y - minimumY) * ratio;
      if (isFirst) {
        isFirst = false;
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
    context.closePath();
    context.restore();

    // let lastPoint: { x: number; y: number } | undefined = undefined;
    // for (const [index, { point }] of paths.entries()) {
    //   if (lastPoint) {
    //     const location = locations.find(({ sectionOrder }) => sectionOrder === index + 1);
    //     if (location) {
    //       const deltaX = lastPoint.x - point.x;
    //       const deltaY = lastPoint.y - point.y;
    //       const length = (deltaX ** 2 + deltaY ** 2) ** 0.5;
    //       const distanceRatio = location.sectionDist / length;

    //       const x = (lastPoint.x - minimumX + deltaX * distanceRatio) * ratio;
    //       const y = height - (lastPoint.y - minimumY + deltaY * distanceRatio) * ratio;

    //       context.save();
    //       context.beginPath();
    //       context.fillStyle = 'red';
    //       context.arc(x, y, 5, 0, 2 * Math.PI);
    //       context.fill();
    //       context.closePath();
    //       context.restore();
    //     }
    //   }
    //   lastPoint = point;
    // }

    for (const { point } of paths) {
      const x = (point.x - minimumX) * ratio;
      const y = height - (point.y - minimumY) * ratio;

      context.save();
      context.beginPath();
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.stroke();
      context.closePath();
      context.restore();
    }
  };

  const createSearchListItem = (item: { id: string; realtime: '1'; regionCode: 'B'; areaName: string; name: string; regionName: string; typeId: string }) => {
    const element = createElement(
      'section',
      {
        style: {
          display: 'flex',
          flexDirection: 'row',
          columnGap: '.2rem',
          alignItems: 'center',
          padding: '.2rem .5rem',
          transition: 'background-color .2s',
          cursor: 'pointer',
        },
      },
      [createElement('span', undefined, [item.name]), createElement('small', undefined, [createElement('code', undefined, [`(${item.id})`])])],
    );
    element.addEventListener('mousemove', () => (element.style.backgroundColor = 'rgba(0, 0, 0, .1)'));
    element.addEventListener('mouseleave', () => (element.style.backgroundColor = ''));
    element.addEventListener('mouseout', () => (element.style.backgroundColor = ''));
    element.addEventListener('blur', () => (element.style.backgroundColor = ''));
    element.addEventListener('click', async () => {
      const getPaths = async () => {
        const url = new URL('https://kakao-bus.r-s-account.workers.dev');
        url.pathname = '/path';
        url.searchParams.set('id', item.id);
        const response = await fetch(url);
        return response.json();
      };
      const getLocations = async () => {
        const url = new URL('https://kakao-bus.r-s-account.workers.dev');
        url.pathname = '/location';
        url.searchParams.set('id', item.id);
        const response = await fetch(url);
        const { vehicleLocation } = await response.json();
        return vehicleLocation;
      };
      const paths = await getPaths();
      const locations = await getLocations();
      drawStationPath(paths, locations);
    });
    return element;
  };

  elements.searchQuery.addEventListener(
    'keyup',
    throttle(async (event) => {
      if (!elements.searchQuery || !elements.searchListContainer || !elements.searchList) {
        return;
      }

      while (elements.searchList.childElementCount > 0) {
        elements.searchList.firstElementChild?.remove();
      }

      const query = elements.searchQuery.value.trim();
      if (query.length === 0) {
        elements.searchListContainer.style.opacity = '0';
        return;
      }

      const url = new URL('https://kakao-bus.r-s-account.workers.dev');
      url.pathname = '/search';
      url.searchParams.set('type', 'bus');
      url.searchParams.set('query', query);
      const response = await fetch(url);
      const { result } = await response.json();
      elements.searchListContainer.style.opacity = '1';
      for (const item of result) {
        elements.searchList.appendChild(createSearchListItem(item));
      }
    }, 200),
  );
});
