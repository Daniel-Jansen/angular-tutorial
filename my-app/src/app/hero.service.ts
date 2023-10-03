import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  }

  constructor(private http: HttpClient, private messageService: MessageService) {}
  
  /** GET heroes from the server */
  getHeroes(): Observable<hero[]> {
    return this.http.get<hero[]>(this.heroesUrl).pipe(tap(_ => this.log('fetched heroes')),
    catchError(this.handleError<hero[]>('getHeroes', []))
    );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<hero>(`getHero id=${id}`))
    );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(tap(_ => this.log(`updated hero id=${hero.id}`)),
    catchError(this.handleError<any>('updateHero'))
    );
  }

  /** GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`) :
        this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<hero[]>('searchHeroes', []))
    );
  }

  //////////// Save methods ////////////

  /** POST: add a new hero to the server */
  addHero(hero: hero): Observable<hero> {
    return this.http.post<hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(id: number): Observable<hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<hero>('deleteHero'))
    );
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 *
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /* Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
