# hello, This is Markdown Live Preview
## 13. May 2016

----
## what is Markdown?
see [Wikipedia](http://en.wikipedia.org/wiki/Markdown)

> Markdown is a lightweight markup language, originally created by John Gruber and Aaron Swartz allowing people "to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML)".

```js
router.use((req, res, next) => {

    // Get the filename from the url
    const filename = req.path.split('/').reduce((last, current) => current, '');

    // Only apply the Cache-Control headers if the requested resource is not blacklisted
    if (!filename.match(/\.(md|json)$/gmi)) {
        res.setHeader('Cache-Control', 'public, max-age=432000');
    }

    next();
});
```

----
## usage
1. Write markdown text in this textarea.
2. Click 'HTML Preview' button.

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

----
## markdown quick reference
# headers

Below are some images that are being joined together

![](http://i.imgur.com/DeURK0T.jpg)
![](http://i.imgur.com/TBJrAEF.jpg)

*emphasis*

This is some **strong** text.

- list
- list
- list
- list
- list
- list
- stuff

The two images below both have titles above them and are joined together

![](https://wallpaperscraft.com/image/clouds_milky_way_eclipse_light_68883_2560x1080.jpg)
## This title is above the image
![](http://ultrawidewallpapers.com/wp-content/uploads/2015/07/snow-covered-trees.jpg)
## This title is above the image

Some text

![](http://ultrawidewallpapers.com/wp-content/uploads/2015/07/snow-covered-trees.jpg)
## [This is a link to google over the image](https://google.com)

>block quote

## [This is a link to google](https://google.com)

The path to this file is: **%%PATH%%**

The filename of this file is: **%%FILE%%**

[links](http://wikipedia.org)

Below is a framed and a circular image

![framed](http://ultrawidewallpapers.com/wp-content/uploads/2015/07/snow-covered-trees.jpg)
![circular](http://ultrawidewallpapers.com/wp-content/uploads/2015/07/snow-covered-trees.jpg)

```css
> pre > code {
    background-color: $colorDark3;
    color: $colorLight1;
    padding: 16px 18px;

    display: block;
    width: calc(100% + 32px);
    transform: translateX(-16px);
}
```

Next some html:

```html
<body>
    <div id="app"></div>
    <script src="/bundle.js"></script>
</body>
```

* railcasts
* monokai-sublime
* androidstudio

----
## changelog
* 17-Feb-2013 re-design

----
## thanks
* [markdown-js](https://github.com/evilstreak/markdown-js)
