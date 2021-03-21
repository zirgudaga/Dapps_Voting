import React from 'react';

export default class Navbar extends React.Component {

    reduceSelectedSession = () => {
        this.props.reduceSelectedSession();
    };

    increaseSelectedSession = () => {
        this.props.increaseSelectedSession();
    }

    render() {
        let affSelectedSessionId = parseInt(this.props.state.selectedSessionId, 10)+1; // Pour l'affichage c'est plus jolie
        return (  
            <nav className="navbar navbar-expand-lg fixed-top navbar-light bg-light mb-3 py-0">
                <div className="container">
                    <a className="navbar-brand" href="/">
                        <img src="logo.png" width="40" height="40" alt="logo_dapps"/>
                    </a>
                    <ul className="navbar-nav">
                        <li className="nav-item ml-auto text-uppercase">
                            <span className="font-weight-bold">Compte connecté :</span> {this.props.state.accounts[0]}
                        </li>
                    </ul>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <button type="button" className="btn btn-dark mr-1"  onClick= {this.reduceSelectedSession}>-</button>
                        </li>
                        <li>
                            <button type="button" className="btn btn-light disabled">{affSelectedSessionId}</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className="btn btn-dark ml-1" onClick= {this.increaseSelectedSession}>+</button>
                        </li>
                    </ul>
                </div>
            </nav>
        )
    }
}