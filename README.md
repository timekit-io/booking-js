# Booking.js by Timekit

> Make a beautiful embeddable booking widget in minutes running on the Timekit API.

⚠️ This is **version 3** of booking.js that supports the new projects model and uses App Widget Key for authentication. 

- Version 1/2 will not be supported anymore

![Booking.js Screenshot](misc/widget-screenshot.png)

## Documentation

All documentation, guides and examples can be found on [our developer portal](https://developers.timekit.io/v2/docs/booking-widget-v2).

*This repo is mainly for community contributions, and the curious soul that would like to customize the widget.*

## Roadmap/todos

See [Issues](https://github.com/timekit-io/booking-js/issues) for feature requests, bugs etc.

## License attributions

The `json-schema` v0.2.3 package is used pursuant to the BSD-3-Clause license

### Setting up locally

Checkout this new project locally using git command showed below:
```
# go to timekit workspace
cd ~/timekit-io

# clone this new project loacally
git clone git@github.com:timekit-io/bookingjs.git

# install depedencies
yarn install

# run bookingjs project
# for local testing use: http://localhost:8081
yarn dev
```

## How to publish changes to npm
make sure you upgrade version number in package.json file follow sementic versioning
- run ```yarn test``
- test manually to make sure widget works fine
- merge your changes to master and pull master branch locally
- make sure your changes are uptodate and clean
- run following commands

```
# login as tulipnpm user
yarn login

# commit and publish new changes
yarn publish
```