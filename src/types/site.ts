
type Message = {
  id: string;
  type: 'info' | 'warning'
  message: string;
  createdAt: string;
}
export type ISiteItem = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address: string;
  messages: Message[];
  createdAt: string;
};