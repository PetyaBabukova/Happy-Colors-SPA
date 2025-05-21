const baseURL =
    process.env.NODE_ENV === 'production'
        ? 'https://api.happycolors.com' // Сложи тук реалния прод URL
        : 'http://localhost:3030';

export default baseURL;
