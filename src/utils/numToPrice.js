export default function numToPrice(num = 0, sum = 'сум') {
  return `${num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${sum}`;
}
