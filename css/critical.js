var critical = require('critical');

critical.generate({
    inline: true,
    base: 'dist',
    src: 'index.html',
    target: {
      html: 'index.html'
    },
    minify: true,
    dimensions: [
      {
        width: 320,
        height: 480
      },
      {
        width: 2000,
        height: 1000
      }
    ]
});
