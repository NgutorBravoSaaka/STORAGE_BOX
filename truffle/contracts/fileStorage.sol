// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {

    event status(string);

    // struct to collect data
    struct File {
        string hash; // hash of ipfs.. consider using bytes
        string fileName; // name of file
        string fileType; // type of file i.e jpeg,mp4,doc etc
        uint256 date; // date of file creation
    }

    //mapping of address and files that are in address
    mapping(address => File[]) files;

    function addFile(string memory _hash, string memory _fileName, string memory _fileType, uint _date) public {
        files[msg.sender].push(File({hash: _hash, fileName: _fileName, fileType: _fileType, date: _date}));
        //push input data to mapping of address to struct
        emit status("file added");
    }

    function getFile(uint256 _index) public view returns (string memory, string memory, string memory, uint256){
        // get file from mapping of address to array of struct
        File memory file = files[msg.sender][_index];
        return (file.hash, file.fileName, file.fileType, file.date);
    }

    function getlength() public view returns (uint256) {
        // get length and iterate for each file and get the index for that file
        return files[msg.sender].length;
    }
}