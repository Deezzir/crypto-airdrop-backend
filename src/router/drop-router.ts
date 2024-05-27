import { Router } from 'express';
import dropController from '../controllers/drop-controller.js';
import * as common from '../common.js';
import queue from 'express-queue';

const dropRouter = Router();
const presaleRouter = Router();
const airdropRouter = Router();

const validationAddUpdateAirdropUser = (req: any, res: any, next: any) => {
  const { user } = req.body;

  if (!user) {
    return res.status(400).json({
      errorMsg: 'No user provided',
    });
  }

  if (!user.wallet || !common.checkWallet(user.wallet)) {
    return res.status(400).json({
      errorMsg: 'No wallet provided',
    });
  }

  // if (!user.tgUsername || !common.TG_USER_REGEX.test(user.tgUsername)) {
  //     return res.status(400).json({
  //         errorMsg: "Invalid telegram username",
  //     });
  // }

  if (!user.xUsername || !common.X_USER_REGEX.test(user.xUsername)) {
    return res.status(400).json({
      errorMsg: 'Invalid twitter username',
    });
  }

  if (!user.xPostLink || !common.X_POST_REGEX.test(user.xPostLink)) {
    return res.status(400).json({
      errorMsg: 'Invalid twitter link',
    });
  }

  next();
};

const validationCheckUserByWallet = (req: any, res: any, next: any) => {
  const { wallet } = req.body;

  if (!wallet || !common.checkWallet(wallet)) {
    return res.status(400).json({
      errorMsg: 'Invalid wallet',
    });
  }

  next();
};

const validationAddUpdatePresaleUser = (req: any, res: any, next: any) => {
  const { user } = req.body;

  if (!user) {
    return res.status(400).json({
      errorMsg: 'No user provided',
    });
  }

  if (!user.wallet || !common.checkWallet(user.wallet)) {
    return res.status(400).json({
      errorMsg: 'No wallet provided',
    });
  }

  if (!user.solAmount || !common.checkSolAmount(user.solAmount)) {
    return res.status(400).json({
      errorMsg: 'Invalid sol amount',
    });
  }

  next();
};

//--------------------drop--------------------

// nothing
dropRouter.get('/airdrop', dropController.getAirdropInfo);
//{
//    numberOfAirdropUsers: number,
//    numberOfMaxAirdropUsers: number,
//    airdropTokenAmount: number,
//    tokenTicker: string,
//    deadline: string,
//    toXFollow: string;
//    xFollowers: number;
//    xAge: number;
//    toTGFollow: string
//}

// nothing
dropRouter.get('/presale', dropController.getPresaleInfo);
//{
//    numberOfPresaleUsers: number,
//    numberOfMaxPresaleUsers: number,
//    presaleMinSolAmount: number,
//    presaleMaxSolAmount: number,
//    presaleTokenAmount: number,
//    presaleSolAmount: number,
//    dropPublicKey: string,
//    tokenTicker: string,
//    deadline: string,
//}

// {
//         wallet: string,
// }
dropRouter.post(
  '/check',
  validationCheckUserByWallet,
  dropController.checkUserByWallet,
);
// {
//     isValidWallet: boolean
//     isPresaleEnrolled: boolean,
//     isAirdropEnrolled: boolean,
//     presaleAmount: number,
//     errorMsgs: string[],
// }

//--------------------airdrop--------------------

// ?wallet=string?xUsername=string?xPostLink=string
airdropRouter.get('/user', dropController.getAirdropUser);
// {
//    wallet: string,
//    xUsername: string,
//    xPostLink: string,
// }

// {
//     user: {
//         wallet: string,
//         xUsername: string,
//         xPostLink: string,
//         tgUsername: string,
//     }
// }
airdropRouter.post(
  '/add',
  queue({ activeLimit: 3, queuedLimit: -1 }),
  validationAddUpdateAirdropUser,
  dropController.addUpdateAidropUser,
);
// {
//     isCreated: boolean,
//     isUpdated: boolean,
// }

//--------------------presale--------------------

// {
//     user: {
//         wallet: string,
//         solAmount: number,
//         txEnroll: string,
//     }
// }
presaleRouter.post(
  '/add',
  validationAddUpdatePresaleUser,
  dropController.addUpdatePresaleUser,
);
// {
//     isCreated: boolean,
//     isUpdated: boolean,
// }

// ?wallet=string
presaleRouter.get('/user', dropController.getPresaleUser);
// {
//     wallet: string,
//     solAmount: number,
//     txEnroll: string[],
// }

// ----------------------------------------------

dropRouter.use('/presale', presaleRouter);
dropRouter.use('/airdrop', airdropRouter);

export default dropRouter;
