// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
const util = require('util')
const child_process = require('child_process')


const logChildResults = (err, stdOut, stdErr) => {
    console.log('finished?', err)
    console.log(stdOut)
    console.error(stdErr)
}
//ls()
async function tscw() {
    console.log('going to await')
    // await exec ('cd src')
    // const srcWatch = child_process.spawn('tsc',['-w', '-p', 'src/tsconfig.json'], {shell:true, stdio: 'inherit' })
    // const srcWatch = child_process.spawn('tsc',[], {shell:true, stdio: 'inherit' })
    const srcWatch = child_process.spawn('tsc -w -p tsconfig.client.json',[], {shell:true, stdio: 'inherit' })
    const nodeWatch = child_process.spawn('tsc -w -p tsconfig.server.json',[], {shell:true, stdio: 'inherit' })
    // const nodeWatch = child_process.spawn('tsc -w -p nodets/tsconfig.json', {stdio:[
    //     0,'pipe'
    // ],stderr:[0,'pipe']})
    console.log('spawned?')
}
tscw()