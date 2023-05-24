import { store } from '../store/store';

export default function getUser() {
  return store.getState().auth.user;
}
