var critical = require('critical');

critical.generate({
    inline: true,
    base: 'dist/',
    src: 'index.html',
    target: {
      html: 'index.html',
    },
    minify: true,
    width: 320,
    height: 480
});
