import cluster from 'cluster';
import { cpus } from 'os';
import process from 'process';
const forks = 4; // cpus().length;
// Takes advantge of every core on you computer

const main = async ()=>{
    const orgIds = [1,2,5];
    const clusterFiles = files.filter((_,index) => index % forks === cluster.worker.id-1);

}



if (!cluster.isWorker){
    const numCPUs = cpus().length;
    console.log(`I am master ${process.pid}`)
    for (let i=0; numCPUs>i;i++){
        cluster.fork(); // makes all the cores run a task
    }
} else {
    console.log(`${process.pid} I am worker ${cluster.worker.id}`)
    main(); // the task one core is going to run
    process.exit(0);
}

