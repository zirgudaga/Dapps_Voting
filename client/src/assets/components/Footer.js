import React from 'react';

export default class Footer extends React.Component {

    render() {
        return(
            <nav className="navbar navbar-expand-lg fixed-bottom navbar-light bg-light mt-5 py-0">
                <div className="container d-flex justify-content-center d-flex align-self-center p-2">
                    <ul className="navbar-nav">
                        <li className="nav-item ml-auto text-uppercase mr-5">
                            Made with love by EDH
                        </li>
                        <li className="nav-item ml-auto text-uppercase ml-5">
                            © 2021 - Dapps Voting
                        </li>
                    </ul>
                </div>
            </nav>
        )
    }
}