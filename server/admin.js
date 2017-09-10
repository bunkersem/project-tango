const ordersDataservice = require('./dataservice/orders');
const orderModel = require('./models').Order;

/**
 * @param 
 */
exports.getCsvOrders = (limit) => {
    return ordersDataservice.getAllOrders(limit)
    .then((orders = []) => {
        let csvContent = '';

        // Create CSV headers
        csvContent += Object.keys(new orderModel()).join(',') + '\n';

        // Create CSV content
        csvContent += orders.map(order => {
            return Object.keys(order)
                .map(key => order[key])
                .map(key => `"${key}"`)
                .join(',')
        }).join('\n') + '\n';
        
        return csvContent;
    })
}