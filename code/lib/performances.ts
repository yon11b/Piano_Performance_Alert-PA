import { Op, type WhereOptions } from "sequelize";
import db from "@/lib";
import { FAMOUS_LEVELS, type FamousLevel, type PerformanceType } from "./performance-types";

export type SearchOptions = { page?: string; limit?: string; search?: string; famous?: string; composer?: string };

export async function getPerformances(options: SearchOptions = {}) {
  const parsedPage = Number(options.page ?? 1);
  const parsedLimit = Number(options.limit ?? 100);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 1000) : 100;
  const conditions: WhereOptions[] = [{ save: "1" }];
  if (FAMOUS_LEVELS.includes(options.famous as FamousLevel)) conditions.push({ famous_level: options.famous });
  const searchTerms = (options.search ?? "").split(",").map(term => term.trim()).filter(Boolean).slice(0, 20);
  const columns = ["title", "story", "cast", "location", "program", "composer"];
  if (searchTerms.length) conditions.push({ [Op.or]: searchTerms.flatMap(term => columns.map(column => ({ [column]: { [Op.substring]: term } }))) });
  if (options.composer?.trim()) conditions.push({ [Op.or]: ["title", "story", "program", "composer"].map(column => ({ [column]: { [Op.substring]: options.composer!.trim() } })) });
  const { count, rows } = await db.Performance.findAndCountAll({
    where: { [Op.and]: conditions },
    order: [["date_start_unix", "ASC"], ["id", "ASC"]],
    limit,
    offset: (page - 1) * limit,
  });
  const performances: PerformanceType[] = rows.map((row: { get: (options: { plain: true }) => unknown }) => row.get({ plain: true }) as PerformanceType);
  return { performances, total: count as number, page, pages: Math.ceil(count / limit) };
}
