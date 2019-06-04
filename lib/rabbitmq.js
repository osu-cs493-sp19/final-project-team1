const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

let connection = null;
let channel = null;

exports.connectToRabbitMQ = async function connectToRabbitMQ(queue) {
    try{
        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();
        await channel.assertQueue(queue);
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            await timeout(100);
            await connectToRabbitMQ(queue);
        } else {
            console.error(err);
        }
    }
};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.getChannel = function () {
    return channel;
};
