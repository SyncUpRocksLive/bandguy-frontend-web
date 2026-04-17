import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheckSquare, faCircleUser, faDrum, faGuitar, faWandSparkles, faPeopleGroup, faPlay, faPause, faGear, faForward } from '@fortawesome/free-solid-svg-icons'

const UserProfileIcon: IconProp = 'circle-user';
const GuitarIcon: IconProp = 'guitar'
const DrumIcon: IconProp = 'drum'
const HostModeStatusIcon: IconProp = 'wand-sparkles';
const GuestModeStatusIcon: IconProp = 'people-group';
const PlayIcon: IconProp = 'play';
const PauseIcon: IconProp = 'pause';
const SkipIcon: IconProp = 'forward'
const ConfigurationIcon: IconProp = 'gear';

const RegisterIconWithLib = () => {
	library.add(faCheckSquare, faCircleUser, faDrum, faGuitar, faWandSparkles, faPeopleGroup, faPlay, faGear, faPause, faForward);
}

export { UserProfileIcon, GuitarIcon, DrumIcon, HostModeStatusIcon, GuestModeStatusIcon, PlayIcon, ConfigurationIcon, PauseIcon, SkipIcon, RegisterIconWithLib };
