import Toast from '@components/Toast';
const fetchRequest = async (url: string, config: Object) => {
  try {
    const response = await fetch(url, config);
    if (response.ok) {
      const { status } = response;
      if (status === 200) {
        const res = await response.json();
        const { status: _status, msg } = res || {};
        if (_status === 0) {
          return res;
        } else {
          console.error('_status_code:', _status, ' errmsg:', msg);
          Toast.info(msg);
          return {};
        }
      } else {
        Toast.info(`response.status: ${status}`);
        return {};
      }
    } else {
      throw new Error(`network error--response.status:${response.status}`);
    }
  } catch (error) {
    console.log('fetch----err',error)
    Toast.info('newtwork error');
    return {};
  }
};

export const post = (url: string, data: Object, headers: Object = {}) => {
  console.log('-----cloud service post params----', url, JSON.stringify(data));

  return fetchRequest(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json;charset=utf-8',
      ...headers
    },
    body: JSON.stringify(data),
  });
};

export const get = (url: string) => {
  return fetchRequest(url, { method: 'GET' });
};

export default fetchRequest;
