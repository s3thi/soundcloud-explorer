import React, { Component } from 'react';
import { Howl } from 'howler';
import SoundCloudPlayer from '../components/SoundCloudPlayer';
import * as constants from '../constants';

class SoundCloudPlayerContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      tracks: [],
      nowPlaying: -1,
      isPaused: true
    };

    // eslint-disable-next-line no-undef
    SC.initialize({
      client_id: constants.SOUNDCLOUD_CLIENT_ID
    });

    this.togglePlay = this.togglePlay.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  togglePlay(index) {
    const indexToPlay = index === -1 ? 0 : index;
    const trackToPlay = this.state.tracks[indexToPlay];

    // If the track is already playing, pause it.
    if (this.state.nowPlaying === indexToPlay) {
      if (trackToPlay.howl.playing()) {
        trackToPlay.howl.pause();
        this.setState({ isPaused: true });
      } else {
        trackToPlay.howl.play();
        this.setState({ isPaused: false });
      }

      return;
    }

    // If the track is not playing, first check to see if there's a Howl object attached to it.
    // If not, create one.
    if (!trackToPlay.howl) {
      trackToPlay.howl = new Howl({
        src: [`${trackToPlay.stream_url}?client_id=${constants.SOUNDCLOUD_CLIENT_ID}`],
        html5: true
      });
    }

    // If another track is playing, stop it.
    const currentlyPlayingTrack = this.state.nowPlaying === -1 ? null : this.state.tracks[this.state.nowPlaying];
    if (currentlyPlayingTrack) {
      currentlyPlayingTrack.howl.stop();
      this.setState({ isPaused: true });
    }

    // Play the track and add an event handler that updates the state as soon as the track
    // starts playing.
    trackToPlay.howl.play();
    this.setState({ nowPlaying: indexToPlay, isPaused: false });
  }

  stop() {
    const currentlyPlayingTrack = this.state.nowPlaying === -1 ? null : this.state.tracks[this.state.nowPlaying];
    if (currentlyPlayingTrack) {
      currentlyPlayingTrack.howl.stop();
    }
  }

  next() {
    const nextTrackIndex = (this.state.nowPlaying + 1) % this.state.tracks.length;
    this.togglePlay(nextTrackIndex);
  }

  previous() {
    const previousTrackIndex = (this.state.nowPlaying + this.state.tracks.length - 1) % this.state.tracks.length;
    this.togglePlay(previousTrackIndex);
  }

  componentDidMount() {
    this.setState({ loading: true });

    // eslint-disable-next-line no-undef
    SC.get('/tracks', {
      genres: this.props.params.genre
    })
      .then(tracks => {
        this.setState({ loading: false, tracks: tracks });
      });
  }

  componentWillUnmount() {
    this.stop();
  }

  render() {
    return <SoundCloudPlayer
      genre={this.props.params.genre}
      loading={this.state.loading}
      tracks={this.state.tracks}
      nowPlaying={this.state.nowPlaying}
      togglePlay={this.togglePlay}
      next={this.next}
      previous={this.previous}
      isPaused={this.state.isPaused}
    />;
  }
}

export default SoundCloudPlayerContainer;
