
var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/userhelpers');
const { stat } = require('fs');

/* GET home page. */
router.get('/api/', function (req, res, next) {
  res.json({ status: true });
});

router.get('/api/check', (req, res) => {
  const user = (req.session.user)
  console.log('check', user);

  if (user) {
    res.json({ user })
  } else {
    res.json({ status: false })
  }
});

router.post('/api/check-pin', (req, res) => {
  console.log('pin', req.body.pin);

  userHelpers.checkPin(req.session.user, req.body.pin).then((response) => {
    console.log('resssss pinr', response);
    res.json(response)
  })
})

router.post('/api/check-premium-pin', (req, res) => {
  console.log('pin', req.body.pin);

  userHelpers.checkPremiumPin(req.session.user, req.body.pin).then((response) => {
    console.log('resssss pinr', response);
    res.json(response)
  })
})

router.post('/api/change-premium', (req, res) => {
  console.log(req.body);
  userHelpers.changePremium(req.session.user._id, req.body).then((response) => {
    console.log(response);
    req.session.user = response

    res.json({ status: true })
  })

})



router.post('/api/deposit', (req, res) => {
 
  console.log(req.body);
  userHelpers.deposite(req.session.user._id, req.body).then((response) => {
    req.session.user = response
    res.json(response)
  })

})
router.post('/api/withdraw', (req, res) => {

  console.log('withhh ammm', req.body.amount);
  userHelpers.withdraw(req.session.user._id, req.body).then((response) => {
    req.session.user = response
    res.json(response)
  })

})

router.post('/api/signup', async (req, res) => {
  try {
    console.log(req.body);
    const response = await userHelpers.doSignup(req.body);
    console.log(response);
    if (response.status) {
      req.session.user = { loggedIn: true, ...response.user };
      console.log('session Updated');

    }
    console.log('sess', req.session);
    console.log('sess user', req.session.user);

    res.json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/api/login', (req, res) => {
  console.log('api call');
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response) => {
    console.log(response);
    req.session.user = response.user
    res.json(response)

  })


})
router.get('/api/logout', (req, res) => {
  req.session.user = null
  res.json({ status: true })
})

router.post('/api/createAccount', (req, res) => {
  console.log('id ', req.session.user._id);
  console.log(req.body.pin);


  userHelpers.createAccount(req.session.user._id, req.body.pin).then((response) => {
    req.session.user = response
    console.log(response);

    res.json(response)
  })
})
router.get('/api/send', (req, res) => {
  console.log('Api call to send');
  userHelpers.getAllUsers().then((response) => {
    res.json(response)
  })

})
router.post('/api/sendAmount', (req, res) => {
  console.log('amount sended log', req.body);
  userHelpers.sendAmount(req.session.user._id, req.body).then((response) => {
    req.session.user = response
    res.json(response)
  })
})

router.post('/api/add-transation', (req, res) => {
  console.log('Transation', req.body);

  userHelpers.addTransation(req.body, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
})



router.get('/api/getDebited-transation', async (req, res) => {
  console.log('api to get tran');
  if (req.session.user) {
    const debitedTran = await userHelpers.getDebitedTran(req.session.user._id)

    res.json(debitedTran)
  } else {
    res.json({ status: false })
  }
})


router.get('/api/getCredited-transation', async (req, res) => {
  if (req.session.user) {
    const creditedTran = await userHelpers.getCreditedTran(req.session.user._id)
    console.log('ccccccc'.creditedTran);

    res.json(creditedTran)
  } else {
    res.json({ status: false })
  }
})

router.get('/api/getWallet-transation', (req, res) => {
  userHelpers.getWalletTransation(req.session.user._id).then((response) => {
    res.json(response)
  })
})

router.get('/api/add-check',(req,res)=>{
   userHelpers.addCheck(req.body)
})

module.exports = router;
