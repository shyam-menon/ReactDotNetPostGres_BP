import axios from 'axios';

const API_URL = '/api/items';

export const getItems = () => axios.get(API_URL);
// Other CRUD operations...

