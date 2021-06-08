const { getTeam } = require("../project/Domain/Team");
const { getReferee } = require("../project/Domain/Referee");
const { addGameToSystem } = require("../project/Domain/FIFARep");
const { addRefereeToSystem } = require("../project/Domain/FIFARep");
const { validateUser } = require("../project/Domain/Register")
const { createUser } = require("../project/Domain/Register")
const { execQuery } = require("../project/DBLayer/DButils");

const request = require("supertest");
const app = require("../project/main");


describe("unit testing for Team", () => {
    beforeAll(async () => await execQuery(
        `insert into [dbo].[Teams]
        (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
        VALUES('DUMMYGROUP', '0', '1', 'Stamford Bridge', 'Roman Abramovich', 'https://www.chelseafc.com/en', '200')`
    ))
    afterAll(async () => await execQuery(
        `
        DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUP';
        `
    ))
    it("should return 'DUMMYGROUP' team details", async () => {
        const teamRes = await getTeam('DUMMYGROUP');
        expect(teamRes.team_name).toEqual('DUMMYGROUP');
    })

    it("should not return any team details", async () => {
        const teamRes = await getTeam('IDONTEXIST');
        expect(teamRes).toEqual(undefined);
    })
});

describe("Integration test for Team with addGameToSystem no NULLs", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE HomeTeam = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE AwayTeam = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
    })
    it("should return 400 - HomeTeam doesn't exist", async () => {
        const req = { body: { homeTeam: 'NOTEXISTS', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The Home Team Doesn't exists in the system." });
    });

    it("should return 400 - AwayTeam doesn't exist", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'NOTEXISTS', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The Away Team Doesn't exists in the system." });
    });

    it("should return 400 - Main Referee doesn't exist", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'NOTEXISTS', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The Main Referee doesn't exists in the system." });
    });


    it("should return 400 - assistent2 Referee doesn't exist", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'NOTEXISTS', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The first assistant Referee doesn't exists in the system." });
    });

    it("should return 400 - assistent1 Referee doesn't exist", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'NOTEXISTS', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The second assistan Referee doesn't exists in the system." });
    });
});

describe("Integration test for Team with addGameToSystem Referees with correct role", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE HomeTeam = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE AwayTeam = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
    })

    it("should return 400 - Main Referee isnt MAIN role", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYASS1REFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "Main Referee Role Doesn't fit" });
    }
    )
    it("should return 400 - Assistent1 Referee isnt Assistent role", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYMAINREFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The first assistan Referee's Role doesn't fit." });
    }
    )

    it("should return 400 - Assistent2 Referee isnt Assistent role", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYMAINREFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The second assistan Referee's Role doesn't fit." });
    }
    )
});

describe("Integration test for Team with addGameToSystem Game ID already in DB", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Games]
            (TIME, HomeTeam, AwayTeam, Stadium, MainReferee, AssistantReferee1, AssistantReferee2, game_id, league, stage)
            VALUES('2021-06-30','DUMMYGROUPHOME', 'DUMMYGROUPAWAY', 'Tedy', 'DUMMYMAINREFEREE','DUMMYASS1REFEREE','DUMMYASS2REFEREE', 'DUMMYGAMEID',217,'DUMMYSTAGE')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE HomeTeam = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE AwayTeam = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
    })
    it("should return 400 - game ID already in DB", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DUMMYGAMEID', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "The Game ID already exists in the system" });
    })
})

describe("Integration test for Team with addGameToSystem one of the team has game in date", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME2', '0', '1', 'DUMMYSTADIUMHOME2', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY2', '0', '1', 'DUMMYSTADIUMAWAY2', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Games]
            (TIME, HomeTeam, AwayTeam, Stadium, MainReferee, AssistantReferee1, AssistantReferee2, game_id, league, stage)
            VALUES('2021-06-30','DUMMYGROUPHOME', 'DUMMYGROUPAWAY', 'Tedy', 'DUMMYMAINREFEREE','DUMMYASS1REFEREE','DUMMYASS2REFEREE', 'DUMMYGAMEID',217,'DUMMYSTAGE')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME2';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY2';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE HomeTeam = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE AwayTeam = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
    })
    it("should return 400 - one of the team has game in the date", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-06-30', id: 'DUMMYGAMEIDNOTEXISTS', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "One of the teams has game in this Date" });
    })

    it("should return 400 - one of the referee has game in the date", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME2', awayTeam: 'DUMMYGROUPAWAY2', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-06-30', id: 'DUMMYGAMEIDNOTEXISTS', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        let res;
        try {
            await addGameToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 400, message: "One of the Referees has game in this Date" });
    })
})

describe("Integration test for Team and Referees, adding Game succesfully to the DB", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE game_id ='DUMMYGAMEID';`
        )
    })
    it("should add new game to the DB", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-06-30', id: 'DUMMYGAMEID', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } };
        await addGameToSystem(req);
        const res = await execQuery(`SELECT * FROM [dbo].[Games] WHERE game_id = 'DUMMYGAMEID';`)
        expect(res.length).toEqual(1);
    })
})

describe("Acceptance test - Add new Game", () => {
    beforeAll(async () => {
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
        );
        await execQuery(
            `insert into [dbo].[Teams]
            (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
            VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
        );
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYMAINREFEREE', 'Novice', 'Main')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS1REFEREE', 'Novice', 'Assistent')`);
        await execQuery(
            `insert into [dbo].[Referees]
            (user_id, Degree, Role)
            VALUES('DUMMYASS2REFEREE', 'Novice', 'Assistent')`);
    })
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYMAINREFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS1REFEREE';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYASS2REFEREE';`
        )
        await execQuery(
            `DELETE FROM [dbo].[Games] WHERE game_id ='DUMMYGAMEID';`
        )
    })
    it('should add new game to the DB', () => {
        request(app).post('/reps/addGameToSystem').send({ body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-06-30', id: 'DUMMYGAMEID', stadium: 'Tedy', league: 1, stage: 'DUMMYSTAGE' } }).expect(200);
    })
})

describe("unit testing for Referee", () => {
    beforeAll(async () => await execQuery(
        `insert into [dbo].[Referees]
        (user_id, Degree, Role)
        VALUES('DUMMYREFEREE', 'Novice', 'Main')`
    ))
    afterAll(async () => await execQuery(
        `
        DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYREFEREE';
        `
    ))
    it("should return 'DUMMYREFEREE' referee details", async () => {
        const refereeRes = await getReferee('DUMMYREFEREE');
        expect(refereeRes.user_id).toEqual('DUMMYREFEREE');
    })

    it("should not return any referee details", async () => {
        const refereeRes = await getReferee('IDONTEXIST');
        expect(refereeRes).toEqual(undefined);
    })
});

describe("Integration Testing valid data sent from user", () => {
    it("should return 406 - only Referee type user is allowed", async () => {
        const req = { body: { userType: 'NotReferee', Role: 'Main', Degree: 'Expert', user_id: 'DUMMYUSERID' } };
        let res;
        try {
            res = await addRefereeToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 406, message: "only Referee type user is allowed" });
    })

    it("should return 406 - unvalid Referee Role", async () => {
        const req = { body: { userType: 'Referee', Role: 'ILLEGALROLE', Degree: 'Expert', user_id: 'DUMMYUSERID' } };
        let res;
        try {
            res = await addRefereeToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 406, message: "only Referee Roles : Assistent or Main are allowed" });
    })

    it("should return 406 - unvalid Referee Degree", async () => {
        const req = { body: { userType: 'Referee', Role: 'Main', Degree: 'ILLEGALDEGREE', user_id: 'DUMMYUSERID' } };
        let res;
        try {
            res = await addRefereeToSystem(req);
        }
        catch (e) {
            res = e;
        }
        expect(res).toEqual({ status: 406, message: "only Referee Degree : Novice or Veteren or Expert are allowed" });
    })
})
describe("Acceptance testing - Register new Referee", () => {
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYUSERID';`
        );
    })
    it("Should register new Referee", async () => {
        await addRefereeToSystem({ body: { user_id: 'DUMMYUSERID', password: '123123123', email: 'dummy@mail.com', country: 'israel', firstName: 'DUMMY', lastName: 'DATA', imgURL: 'img.gif', userType: 'Referee', Role: 'Main', Degree: 'Expert' } });
        const res = await execQuery(`SELECT * FROM [dbo].[Referees] WHERE user_id = 'DUMMYUSERID'`);
        expect(res.length).toEqual(1);
    })
})
describe("unit Testing for validate user", () => {
    describe("UserName already taken", () => {
        beforeAll(async () => {
            await execQuery(
                `insert into [dbo].[Users]
                (user_id, password, email, first_name, last_name, img_url, userType, country)
                VALUES('DUMMYUSERID', '123123123', 'DUMMAY@MAIL.COM', 'DUMMY', 'USER', 'GOOGLE.COM', 'regular', 'Israel')`
            );
        })
        afterAll(async () => {
            await execQuery(
                `DELETE FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID';`
            );
        })
        it('should throw { status: 409, message: "Username taken" }', async () => {
            let res;
            try {
                res = await validateUser("DUMMYUSERID");
            }
            catch (e) {
                res = e;
            }
            expect(res).toEqual({ status: 409, message: "Username taken" });
        })
    })

    describe("userName not taken", () => {
        afterAll(async () => {
            await execQuery(
                `DELETE FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID';`
            );
        })
        it('should return success', async () => {
            let res;
            try {
                res = await validateUser("DUMMYUSERID");
            }
            catch (e) {
                res = e;
            }
            expect(res).toMatch('success');
        })
    })

});

describe("unit Testing for create user", () => {
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Represntetives] WHERE user_id = 'DUMMYUSERIDREP';`
        );
    })

    it('should store new user Regular inserted to DB', async () => {
        await createUser({ body: { user_id: 'DUMMYUSERID', password: '123123123', email: 'dummy@mail.com', country: 'israel', firstName: 'DUMMY', lastName: 'DATA', imgURL: 'img.gif', userType: 'Regular' } });
        const res = await execQuery(`SELECT * FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID'`);
        expect(res[0].userType).toEqual('Regular');
    })

    it('should store new user Representive inserted to DB', async () => {
        await createUser({ body: { user_id: 'DUMMYUSERIDREP', password: '123123123', email: 'dummy@mail.com', country: 'israel', firstName: 'DUMMY', lastName: 'DATA', imgURL: 'img.gif', userType: 'FifaRep' } });
        const res = await execQuery(`SELECT * FROM [dbo].[Represntetives] WHERE user_id = 'DUMMYUSERIDREP'`);
        expect(res.length).toEqual(1);
    })
})

describe("Acceptance test - Add new Referee", () => {
    afterAll(async () => {
        await execQuery(
            `DELETE FROM [dbo].[Users] WHERE user_id = 'DUMMYUSERID';`
        );
        await execQuery(
            `DELETE FROM [dbo].[Referees] WHERE user_id = 'DUMMYUSERID';`
        );
    })
    it('should add new game to the DB', () => {
        request(app).post('/reps/addRefereeToSystem').send({ body: { user_id: 'DUMMYUSERID', password: '123123123', email: 'dummy@mail.com', country: 'israel', firstName: 'DUMMY', lastName: 'DATA', imgURL: 'img.gif', userType: 'Referee', Role: 'Main', Degree: 'Expert' } }).expect(200);
    })
})