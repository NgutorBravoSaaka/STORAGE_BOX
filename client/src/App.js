import React, { Component } from "react";
import FileStorage from "./contracts/FileStorage.json";
import getweb3 from "./getWeb3";
import "./App.css";
import Moment from "react-moment";
import { StyledDropZone } from 'react-drop-zone';
import {FileIcon, defaultStyles} from 'react-file-icon';
import fileReaderPullStream from 'pull-file-reader';
import ipfs from './ipfs';
import "react-drop-zone/dist/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import { Table } from "reactstrap";

//require('cors');




class App extends Component {
    state = {FileStorage: [], web3: null, accounts: null, contract: null};
    componentDidMount = async () => {
        try {
            // get network provider and web3 innstance.
            const web3 = await getweb3();

            // use web3 to get the user's account
            const accounts = await web3.eth.getAccounts();

            // get the cpntract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = FileStorage.networks[networkId];
            const instance = new web3.eth.Contract(
                FileStorage.abi,
                deployedNetwork && deployedNetwork.address,
            );

            //set web3, accounts and contract to the state, and then proceed with an
            // example of interacting with the contrac's method.
            this.setState({ web3, accounts, contract: instance}, this.getFiles);
            // web3.currentProvider.publicConfigStore.on('update', async () => {
            //     const changedAccounts = await web3.eth.getAccounts();
            //     this.setState({accounts: changedAccounts});
            //     this.getFiles();
            // })
        } catch (error) {
            // catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. check console for details`,
            );
            console.log(error);
        }
    };

    getFiles = async () => {
        // get accounts and contract from state variable
        try {
            const {accounts, contract} = this.state;
            const fileLength = await contract.methods.getlength().call({from: accounts[0]});
            let files = []
            for (let i = 0; i < fileLength; i++) {
                let file = await contract.methods.getFile(i).call({from: accounts[0]});
                files.push(file);
            }
            // set file state of app
            this.setState({FileStorage: files});
        } catch (error) {
            console.log(error);
        }
    };

    onDrop = async (file) => {
        try {
            const {contract, accounts} = this.state;
            const stream = fileReaderPullStream(file);
            const result = await ipfs.add(stream);
            const timestamp = Math.round(+new Date() / 1000); //unix timestamp
            const type = file.name.substr(file.name.lastIndexOf(".")+1); // returns file type
            let uploaded = await contract.methods.addFile(result[0].hash, file.name, type, timestamp).send({from: accounts[0]});
            console.log(uploaded);
            //debugger;
            this.getFiles();
            

        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const {FileStorage} = this.state;
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contracts...</div>;
        }
        return (
            <div className="App">
                <div className="container pt-3">
                    <StyledDropZone onDrop={this.onDrop}/>
                    <Table>
                        <thead>
                            <tr>
                                <th width="2%" scope="row">Type</th>
                                <th className="text-left">File name</th>
                                <th className="text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <div>{FileStorage !==[] ? FileStorage.map((item, key)=>(
                                 <tr>
                                    <th><FileIcon size={10} extension={item[2]} {...defaultStyles[item[2]]} /></th>
                                    <th className="text-left">{<a href={"https://ipfs.io/ipfs/"+item[0]}>{item[1]}</a>}</th>
                                    <th className="text-right"><Moment format="YYYY/MM/DD" unix>{item[3]}</Moment></th>
                                </tr>
                                )) : null};
                            </div>
                        </tbody>
                    </Table> 
                </div>
            </div>
        );
    }
}
export default App;