dependencies:
    axios
    express

notes 
I have not implemented a secure token approach in this solution
A secure solution could consist of:
    hashed key?
    the controle request 

hook calls are made with Promises
    what does that mean for the solution?

document persistence strategy
    have chosen an array based persistence strategy with an unoptimized lookup method
    more robust solution could be a hashbased structure

assuming the client has a clientId gotten through a secure method

