import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: 'c4cffaf27032607d0fec',
    cluster: 'eu',
    forceTLS: true,
});

export default echo;