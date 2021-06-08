const { getTeam } = require("../project/Domain/Team");
const { getReferee } = require("../project/Domain/Referee");
const { addGameToSystem } = require("../project/Domain/FIFARep");
const { execQuery } = require("../project/DBLayer/DButils");

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
    it("should return 'DUMMYREFEREE' team details", async () => {
        const refereeRes = await getReferee('DUMMYREFEREE');
        expect(refereeRes.user_id).toEqual('DUMMYREFEREE');
    })

    it("should not return any team details", async () => {
        const refereeRes = await getReferee('IDONTEXIST');
        expect(refereeRes).toEqual(undefined);
    })
});

describe("Integration test for Team with addGameToSystem", () => {
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
    it("should return 400 - homeTeam doesn't exist", async () => {
        const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', mainRef: 'DUMMYMAINREFEREE', assRef1: 'DUMMYASS1REFEREE', assRef2: 'DUMMYASS2REFEREE', date: '2021-11-11', id: 'DOESNTEXIST', stadium: 'Tedy', league: 'DUMMYLEAGUE', stage: 'DUMMYSTAGE' } };
        const res = await addGameToSystem(req);
        expect(res).toMatch('good');
    })

    // it("should return 400 - awayTeam doesn't exist", async () => {
    //     const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DOESNTEXIST', date: '2021-11-11', game_id: 'DOESNTEXIST', stadium: 'Tedy' } }
    //     const res = await addGameToSystem(req);
    //     expect(res).toEqual(400);
    // })

    // it("should return 200 - all details are valids", async () => {
    //     const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', date: '2021-11-11', game_id: 'DOESNTEXIST', stadium: 'Tedy' } }
    //     const res = await addGameToSystem(req);
    //     expect(res).toEqual(200);
    // })
});

// describe('Integration tests for Team with addGameToSystem - Part 2', () => {
//     beforeAll(async () => {
//         await execQuery(
//             `insert into [dbo].[Teams]
//         (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
//         VALUES('DUMMYGROUPHOME', '0', '1', 'DUMMYSTADIUMHOME', 'DUMMYCOACHHOME', 'DUMMYPPHOME', '200')`
//         );
//         await execQuery(
//             `insert into [dbo].[Teams]
//         (team_name, expenses, Coach, Stadium, TeamOwner, PersonalPage, status)
//         VALUES('DUMMYGROUPAWAY', '0', '1', 'DUMMYSTADIUMAWAY', 'DUMMYCOACHAWAY', 'DUMMYPPAWAY', '200')`
//         );
//         await execQuery(`
//         insert into [dbo].[Games]
//         (Time, HomeTeam, AwayTeam, Stadium, game_id)
//         VALUES('10-10-2021','DUMMYGROUPHOME','DUMMYGROUPAWAY', 'Etihad', 'DUMMYGAMEID' );
//         `);
//     })
//     afterAll(async () => {
//         await execQuery(
//             `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPHOME';`
//         );
//         await execQuery(
//             `DELETE FROM [dbo].[Teams] WHERE team_name = 'DUMMYGROUPAWAY';`
//         );
//         await execQuery(
//             `DELETE FROM [dbo].[Games] WHERE HomeTeam = 'DUMMYGROUPHOME';`
//         );
//         await execQuery(
//             `DELETE FROM [dbo].[Games] WHERE AwayTeam = 'DUMMYGROUPAWAY';`
//         );
//         await execQuery(
//             `DELETE FROM [dbo].[Games] WHERE game_id = 'DUMMYGAMEID';`
//         )
//     })
//     it('should return 400 - Game ID already exist', async () => {
//         const req = { body: { homeTeam: 'DUMMYGROUPHOME', awayTeam: 'DUMMYGROUPAWAY', date: '2021-11-11', game_id: 'DUMMYGAMEID', stadium: 'Tedy' } }
//         const res = await addGameToSystem(req);
//         expect(res).toEqual(400);
//     })
// })