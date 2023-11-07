const observerEntitiesMap = new Map();

// 成型结构
// const map = new Map([
//   [
//     'target',
//     new Map([
//       [
//         'event',
//         {
//           eventList: new Set([]),
//           handler: () => {
//             /** this.eventList.forEach */
//           },
//         },
//       ],
//     ]),
//   ],
// ]);

export function addEventListener(target, _event, fn) {
  if (!target) return;

  let entityMap;

  if (observerEntitiesMap.has(target)) {
    entityMap = observerEntitiesMap.get(target);

    if (entityMap.has(_event)) {
      entityMap.get(_event).eventList.add(fn);
      return;
    }
  }

  const obj = {
    eventList: new Set([fn]),
    handler() {
      obj.eventList.forEach((item) => item.call(target, event));
    },
  };

  if (entityMap) {
    entityMap.set(_event, obj);
  } else {
    observerEntitiesMap.set(target, new Map([[_event, obj]]));
  }

  target.addEventListener(_event, obj.handler);
}

export function removeEventListener(...arg) {
  const [target, _event, fn] = arg;

  const entityMap = observerEntitiesMap.get(target);
  if (!entityMap) return;
  const eventMap = entityMap.get(_event);

  switch (arg.length) {
    case 1:
      entityMap.forEach((item, key) => {
        target.removeEventListener(key, item.handler);
      });
      observerEntitiesMap.delete(target);
      break;
    case 2:
      if (!eventMap) return;

      target.removeEventListener(_event, eventMap.handler);

      entityMap.delete(_event);
      !entityMap.size && observerEntitiesMap.delete(target);
      break;
    case 3:
      if (!eventMap) return;

      eventMap.eventList.delete(fn);
      !eventMap.eventList.size && removeEventListener(target, _event);
      break;
  }
}
