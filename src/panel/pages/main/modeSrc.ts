import hotYellow from '@img/hot_yellow.svg';
import coldBlue from '@img/cold_blue.svg';
import autoBlue from '@img/auto_blue.svg';
import auto from '@img/auto.svg';
import cold from '@img/cold.svg';
import hot from '@img/hot.svg';

const modeSrc = {
    0: {
        icon: {
            normal: auto,
            on: autoBlue
        },
        intl: 'autoMode'
    },
    1: {
        icon: {
            normal: cold,
            on: coldBlue
        },
        intl: 'coldMode'
    },
    4: {
        icon: {
            normal: hot,
            on: hotYellow
        },
        intl: 'hotMode'
    }
}

export default modeSrc