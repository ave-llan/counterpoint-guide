A visual and audio interface built on top of the [computational-counterpoint module](https://github.com/jrleszcz/counterpoint) for writing counterpoint. See a live example [here](http://musicmachine.io).

## Basic Usage
Add [counterpoint-guide.min.js](counterpoint-guide.min.js) to your project at the end of the body:
```html
<script type="text/javascript" src="counterpoint-guide.min.js"></script>
```

Then add the custom counterpoint element wherever you would like a guide:
```html
<counterpoint></counterpoint>
```
This will create a default guide in C major.  Every guide is independent and you can create as many as you like on a single page.

## Customization
You can customize each `<counterpoint>` element with a number of attritbutes.

```html
<counterpoint
      height="300"
  first-note="Eb5"
        mode="major"
   max-range="10"
       notes="Eb5 Bb5 Ab5 G5 C6 Bb5">
</counterpoint>
```

Attribute    |  Default |  Description
---------:   | :------- | :--------------------------------------------
 height      | 450      | the max-height in device pixels of the guide
 first-note  | C4       | the first note of the guide, given in [scientific pitch notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation)
 mode        | major    | a valid [mode](https://en.wikipedia.org/wiki/Mode_(music)#Modern) like 'minor' or 'dorian''
 max-range   | 10       | restricts composition to this interval size
 notes       | C4       | space separated pitches indicating the initial cantus firmus (create a finished or in-progress guide)


## About
Visualization created with [D3.js](d3js.org).
Pitches are synthesized with the help of [Tone.js](http://tonejs.org/).
Sound icons courtesy of Google's [Material Design](https://www.google.com/design/icons/).

Counterpoint rules largely based on Salzer and Schachter's [Counterpoint in Composition](http://amzn.to/1kssKjp).
