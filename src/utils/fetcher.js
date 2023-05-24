import { request } from 'services'

export const fetcher = (url) => request.get(url).then((res) => res.data).catch((err) => err)
