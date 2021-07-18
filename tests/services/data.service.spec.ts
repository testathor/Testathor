import { of } from 'rxjs';
import { DataService } from '../../src/app/core/services/data.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { autoSpy } from '../auto-spy';
import { csvString, dataFileTeamStructure, jsonData } from '../constants/data.constants';

describe('DataService', () => {
  describe('.getDataFile()', () => {
    it("returns a json representation of the repo's data csv", (done) => {
      const { build, githubService } = setup();
      const dataService = build();
      githubService.fetchDataFile.and.returnValue(of({ data: csvString }));

      dataService.getDataFile().subscribe((actual) => {
        expect(actual).toEqual(jsonData);
        done();
      });
    });

    it('initializes an internal data structure that maps teamIds to Team objects', (done) => {
      const { build, githubService } = setup();
      const dataService = build();
      githubService.fetchDataFile.and.returnValue(of({ data: csvString }));

      dataService.getDataFile().subscribe((actual) => {
        expect(dataService.dataFile).toEqual(dataFileTeamStructure);
        done();
      });
    });
  });

  describe('.getTeam(teamId)', () => {
    it('returns the Team object corresponding to the given teamId', () => {
      // arrange
      const { build } = setup();
      const dataService = build();
      spyOn(dataService, 'getDataFile').and.callFake(() => {
        dataService.dataFile = dataFileTeamStructure;
        return of({});
      });
      // act
      dataService.getDataFile();
      // assert
      expect(dataService.getTeam('CS2103T-W12-3')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-3'));
      expect(dataService.getTeam('CS2103T-W12-4')).toEqual(dataFileTeamStructure.teamStructure.get('CS2103T-W12-4'));
      expect(dataService.getTeam('CS2103T-W12-1')).toBeUndefined();
      expect(dataService.getTeam('CS2103T-W12-2')).toBeUndefined();
    });
  });

  describe('.getTeams()', () => {
    it("returns an array containing ids of the teams in the repo's data csv", () => {
      // arrange
      const { build } = setup();
      const dataService = build();
      spyOn(dataService, 'getDataFile').and.callFake(() => {
        dataService.dataFile = dataFileTeamStructure;
        return of({});
      });
      const teams = ['CS2103T-W12-3', 'CS2103T-W12-4'];
      // act
      dataService.getDataFile();
      const actual = dataService.getTeams();
      // assert
      expect(actual).toEqual(teams);
    });
  });

  describe('.reset()', () => {
    it('clears the internal state of the DataService', () => {
      // arrange
      const { build } = setup();
      const dataService = build();
      spyOn(dataService, 'getDataFile').and.callFake(() => {
        dataService.dataFile = dataFileTeamStructure;
        return of({});
      });
      // assert
      dataService.getDataFile();
      expect(dataService.dataFile).toBeDefined();
      dataService.reset();
      expect(dataService.dataFile).toBeUndefined();
    });
  });
});

function setup() {
  const githubService = autoSpy(GithubService);
  const builder = {
    githubService,
    build() {
      return new DataService(githubService);
    }
  };

  return builder;
}
