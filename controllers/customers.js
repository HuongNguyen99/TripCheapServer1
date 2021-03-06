const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Customer = require("../models/customer");

exports.createCustomer = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
      .then(hash => {
          const customer = new Customer({
              email: req.body.email,
              username: req.body.username,
              password: hash
          });
          customer.save()
              .then(result => {
                  res.status(201).json({
                      message: 'Customer created!',
                      result: result
                  });
              })
              .catch(err => {
                  res.status(500).json({
                      message: 'Invalid authentication credentials!' + err
                  });
              });
      });
}

exports.customerLogin = (req, res, next) => {
  let fetchCustomer;
  Customer.findOne({email: req.body.email})
      .then(customer => {
        if(!customer) {
            return res.status(401).json({
                message: 'Email bạn nhập sai hoặc không có!'
            });
        }
        fetchCustomer = customer;
        return bcrypt.compare(req.body.password, customer.password);
      })
      .then(result => {
        if(!result) {
            return res.status(401).json({
                message: 'Nhập sai password'
            });
        }
        const token = jwt.sign(
            {
                email: fetchCustomer.email, 
                customerId: fetchCustomer._id
            },
            "secret_this_should_be_longer",
            {
                expiresIn: '1h'
            }
        );
        //   console.log('token: ' + token);
        res.status(200).json({
            token: token,
            expiresIn: 3600,
            customerId: fetchCustomer._id,
            username: fetchCustomer.username,
            created_at: fetchCustomer.created_at,
            message: 'Đăng nhập thành công'
        })

      })
      .catch(err => {
          return res.status(401).json({
              message: 'Email bạn nhập sai hoặc không có!'
          });
      });
}


exports.getInfoCustomer = (req, res, next) => {
  Customer.findById({_id: req.userData.customerId})
    .then(documents => {
        if(documents) {
            res.status(200).json(documents);
        } else {
            res.status(404).json({ message: "Not found!" });
        }
  }).catch(error => {
      res.status(500).json({
        message: "Fetching info customer failed!" + error + req.userData.customerId
      })
  })
}

exports.getInfoCustomerFromManager = (req, res, next) => {
    Customer.findById({_id: req.params.id })
      .then(documents => {
          if(documents) {
              res.status(200).json(documents);
          } else {
              res.status(404).json({ message: "Not found!" });
          }
    }).catch(error => {
        res.status(500).json({
            message: "Fetching info customer failed!" + error
        })
    })
  }

exports.updateInfo = (req, res, next) => {

    const infoCustomer = new Customer({
        _id: req.userData.customerId,
        email: req.body.email,
        username: req.body.username,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address
    });

    console.log(infoCustomer);

    Customer.updateOne(
        { _id: req.userData.customerId}, infoCustomer
    ).then(result => {
        res.status(200).json({
            message: 'Update info successful!',
            customerInfo: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Couldn't update info!" + error
          })
    })
}

exports.changePassword = (req, res, next) => {
    bcrypt.hash(req.body, 10)
        .then(hash => {
            Customer.updateOne({ _id: req.userData.customerId}, {password: hash})
                .then(result => 
                    {
                        res.status(200).json({
                            message: 'Change password successfully!',
                            result: result
                        })
                    }).catch(error => {
                        res.status(500).json({
                            message: 'Change password failed!',
                            error: error
                        })
                    });
        });
  }

  exports.deleteAccount = (req, res, next) => {
    // console.log('----------------');
    // console.log('req: ', req.params)
    Customer.deleteOne({ _id: req.params.id}).then(
        result => {
        if(result.n > 0) {
          res.status(200).json({ message: "Xóa tài khoản thành công!" });
         } else {
          res.status(401).json({ message: "Chưa đăng nhập!" });
         }
      }).catch(error => {
        res.status(500).json({
          message: 'Xóa tài khoản thất bại!'
        })
      })
  }