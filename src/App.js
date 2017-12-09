import React, {Component} from 'react';
import {DateTime} from 'luxon';
import Modal from 'react-modal';
import './App.css';

const NAME_LS = 'NAME_LS';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class MiCasa extends Component {
  constructor() {
    super();

    var time = this.getTime();

    this.state = {
      time,
      name: '',
      isNameRequired: false,
      salutation: this.determineSalutation(time.hour),
      quote: null,
      geolocation: {
        latitude: null,
        longitude: null
      },
      location: null,
      temperature: null,
      weatherAPIKey: '594d083c4f45203a1d8cf6c1f7dd0a0b',
      weatherIcon: null,
      modalIsOpen: false,
      inputValue: ''
    };

    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  closeModal() {
    this.setState({modalIsOpen: false});
    this.setState({name: this.state.inputValue});
    localStorage.setItem(NAME_LS, this.state.inputValue);
  }

  handleChange(e) {
    this.setState({inputValue: e.target.value});
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position =>
        this.setState(
          {
            geolocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          },
          () => this.updateWeather()
        ),
      () => {
        throw 'Error occured!';
      }
    );
    Modal.setAppElement('body');
  }

  componentDidMount() {
    const name = localStorage.getItem(NAME_LS);
    if (name) {
      this.setState({name});
    } else {
      this.setState({modalIsOpen: true});
    }

    fetch('https://horizonshq.herokuapp.com/api/inspirationalquotes')
      .then(resp => resp.json())
      .then(resp => this.setState({quote: resp.message}));

    setInterval(() => {
      var time = DateTime.local();
      this.setState({
        time,
        salutation: this.determineSalutation(time.hour)
      });
    }, 1000 * 1);
  }

  determineSalutation(hour) {
    if (hour > 11 && hour < 19) {
      return 'afternoon';
    } else if (hour > 18) {
      return 'evening';
    } else {
      return 'morning';
    }
  }

  determineWeatherCondition(str) {
    switch (str) {
      case 'Rain':
        return 'wi-day-rain';
      case 'Thunderstorm':
        return 'wi-day-thunderstorm';
      case 'Drizzle':
        return 'wi-day-showers';
      case 'Extreme':
        return 'wi-day-snow-thunderstorm';
      case 'Snow':
        return 'wi-day-snow';
      case 'Clouds':
        return 'wi-day-cloudy';
      case 'Clear':
        return 'wi-day-sunny';
      default:
        return null;
    }
  }

  updateWeather() {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?APPID=${
        this.state.weatherAPIKey
      }&lat=${this.state.geolocation.latitude}&lon=${
        this.state.geolocation.longitude
      }`
    )
      .then(resp => resp.json())
      .then(resp =>
        this.setState({
          location: resp.name,
          temperature: Math.round(resp.main.temp - 273.15),
          weatherIcon: this.determineWeatherCondition(resp.weather[0].main)
        })
      );
  }

  getTime() {
    return DateTime.local();
  }

  getBGStyle(category = 'HK') {
    return {
      backgroundImage: `url(https://source.unsplash.com/2560x1600/daily?${category})`,
      backgroundSize: 'cover',
      height: '100vh'
    }
  }

  render() {
    return (
      <div style={this.getBGStyle(this.state.category)}>
        <div className="bg-wrapper">
          <div className="text-right top-right weather">
            <div>
              <i className={`wi ${this.state.weatherIcon}`} />&nbsp;<span id="weather" />
              {this.state.temperature}&#8451;
            </div>
            <h5 id="location">{this.state.location}</h5>
          </div>
          <div className="text-center centered">
            <div className="block-text">
              <h1 id="time">{this.state.time.toFormat("h':'mm")}</h1>
              <h2 id="ampm">{this.state.time.toFormat('a')}</h2>
            </div>
            <h3 id="greetings">
              Good {this.state.salutation}, {this.state.name}
            </h3>
            <Modal
              isOpen={this.state.modalIsOpen}
              style={customStyles}
              contentLabel="name-modal"
            >
              <div>What's your name?</div>
                <input name="name" type="text" onChange={this.handleChange}/>
                <button onClick={this.closeModal}>
                  Next
                </button>
            </Modal>
          </div>
          <div className="text-center bottom-third quote">
            <div id="quote-text">{this.state.quote}</div>
          </div>
          <div className="text-right bottom-right">
            <div id="settings-text">
              <h6><i class="fa fa-cog"></i>Settings</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MiCasa;
